import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { LandingPagesService } from './landing-pages.service';
import { CreateLandingPageDto, UpdateLandingPageDto } from './dto/landing-page.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('landing-pages')
export class LandingPagesController {
    constructor(private readonly service: LandingPagesService) {}

    // Public endpoint to view a landing page
    @Get('public/:slug')
    async findBySlug(@Param('slug') slug: string) {
        const page = await this.service.findBySlug(slug);

        // ส่ง uid ของเจ้าของเพจออกไปด้วย เพื่อใช้กับ Analytics / Form Integration ฝั่ง frontend
        const ownerUid = (page as any).user?.uid ?? null;
        const referralCode = (page as any).user?.referral_code ?? null;

        return {
            ...page,
            owner_uid: ownerUid,
            referral_code: referralCode,
        };
    }

    // Protected endpoints for management
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req, @Body() dto: CreateLandingPageDto) {
        return this.service.create(req.user.userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Request() req) {
        return this.service.findAll(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.service.findOne(+id, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() dto: UpdateLandingPageDto) {
        return this.service.update(+id, req.user.userId, dto);
    }

    // แยก endpoint สำหรับบันทึกแบบ Draft โดยไม่ยุ่งกับสถานะ publish
    @UseGuards(JwtAuthGuard)
    @Patch(':id/draft')
    saveDraft(@Request() req, @Param('id') id: string, @Body() dto: UpdateLandingPageDto) {
        // ป้องกันไม่ให้เปลี่ยน is_published ผ่าน draft endpoint
        const { is_published, ...rest } = dto as any;
        return this.service.update(+id, req.user.userId, rest as UpdateLandingPageDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.service.remove(+id, req.user.userId);
    }
}
