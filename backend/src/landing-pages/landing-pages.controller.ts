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
        return this.service.findBySlug(slug);
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

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.service.remove(+id, req.user.userId);
    }
}
