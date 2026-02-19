import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, renameSync, unlinkSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Temp storage - files saved here first, then moved to user folder after auth
const tempUploadPath = join(process.cwd(), 'uploads', 'temp');

const createTempStorage = () => diskStorage({
    destination: (req: any, file, cb) => {
        if (!existsSync(tempUploadPath)) {
            mkdirSync(tempUploadPath, { recursive: true });
        }
        cb(null, tempUploadPath);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `${timestamp}-${randomStr}${ext}`);
    }
});

// Helper to move file from temp to user directory
const moveToUserDir = (tempPath: string, userId: string | number, subFolder: string = ''): string => {
    const userUploadPath = join(process.cwd(), 'uploads', String(userId), subFolder);

    if (!existsSync(userUploadPath)) {
        mkdirSync(userUploadPath, { recursive: true });
    }

    const filename = tempPath.split('/').pop() || tempPath.split('\\').pop();
    const newPath = join(userUploadPath, filename!);

    renameSync(tempPath, newPath);

    return filename!;
};

@Controller('uploads')
export class UploadsController {
    @UseGuards(JwtAuthGuard)
    @Post('image')
    @UseInterceptors(FileInterceptor('file', {
        storage: createTempStorage(),
        limits: {
            fileSize: 20 * 1024 * 1024, // 20MB
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
            console.error('No file received in uploadImage');
            throw new BadRequestException('No file uploaded');
        }

        const userId = req.user?.sub;
        if (!userId) {
            // Clean up temp file
            try { unlinkSync(file.path); } catch (e) {}
            throw new BadRequestException('User not authenticated');
        }

        try {
            // Move file from temp to user directory
            const filename = moveToUserDir(file.path, userId);
            const relativePath = `/uploads/${userId}/${filename}`;

            console.log(`Image uploaded successfully: ${relativePath} for user ${userId}`);

            return {
                url: relativePath,
                filename: filename,
                size: file.size,
                mimetype: file.mimetype
            };
        } catch (error) {
            console.error('Error moving file:', error);
            // Clean up temp file on error
            try { unlinkSync(file.path); } catch (e) {}
            throw new BadRequestException('Failed to process uploaded file');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('video')
    @UseInterceptors(FileInterceptor('file', {
        storage: createTempStorage(),
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

        const userId = req.user?.sub;
        if (!userId) {
            // Clean up temp file
            try { unlinkSync(file.path); } catch (e) {}
            throw new BadRequestException('User not authenticated');
        }

        try {
            // Move file from temp to user's videos directory
            const filename = moveToUserDir(file.path, userId, 'videos');
            const relativePath = `/uploads/${userId}/videos/${filename}`;

            console.log(`Video uploaded successfully: ${relativePath} for user ${userId}`);

            return {
                url: relativePath,
                filename: filename,
                size: file.size,
                mimetype: file.mimetype
            };
        } catch (error) {
            console.error('Error moving video file:', error);
            // Clean up temp file on error
            try { unlinkSync(file.path); } catch (e) {}
            throw new BadRequestException('Failed to process uploaded video');
        }
    }
}
