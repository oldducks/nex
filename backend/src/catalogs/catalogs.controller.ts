import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException, Res } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import type { Response } from 'express';

@Controller('catalogs')
export class CatalogsController {
  constructor(
    private readonly catalogsService: CatalogsService,
    private readonly usersService: UsersService,
  ) { }

  // Public endpoints
  @Get('public/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.catalogsService.findBySlug(slug);
  }

  @Get('view/:id')
  async findOnePublic(@Param('id') id: string) {
    return this.catalogsService.findOnePublic(+id);
  }

  @Get('view/:id/download-pdf')
  async downloadPublicPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, fileName } = await this.catalogsService.generatePublicPdf(+id);
    const asciiFallback = fileName.replace(/[^\x20-\x7E]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );
    return res.send(buffer);
  }

  @Get('user-public/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.catalogsService.findByUserId(+userId);
  }

  // Protected endpoints
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createCatalogDto: CreateCatalogDto) {
    const config = await this.usersService.getFeatureConfig(req.user.sub);
    if (!config.catalog) {
      throw new ForbiddenException('ฟีเจอร์แคตตาล็อกสินค้ายังไม่ถูกเปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่ออัพเกรด');
    }
    return this.catalogsService.create(req.user.userId, createCatalogDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    const config = await this.usersService.getFeatureConfig(req.user.sub);
    if (!config.catalog) {
      // Return empty array instead of error for dashboard view if needed?
      // But user wanted strict control.
      throw new ForbiddenException('Feature restricted');
    }
    return this.catalogsService.findAll(req.user.userId);
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string) {
    const config = await this.usersService.getFeatureConfig(req.user.sub);
    if (!config.catalog) {
       throw new ForbiddenException('Feature restricted');
    }
    return this.catalogsService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Request() req, @Param('id') id: string, @Body() updateCatalogDto: UpdateCatalogDto) {
    const config = await this.usersService.getFeatureConfig(req.user.sub);
    if (!config.catalog) {
       throw new ForbiddenException('Feature restricted');
    }
    return this.catalogsService.update(+id, req.user.userId, updateCatalogDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string) {
    const config = await this.usersService.getFeatureConfig(req.user.sub);
    if (!config.catalog) {
       throw new ForbiddenException('Feature restricted');
    }
    return this.catalogsService.remove(+id, req.user.userId);
  }

  @Post(':id/generate-pdf')
  @UseGuards(JwtAuthGuard)
  async generatePdf(@Request() req, @Param('id') id: string) {
    const config = await this.usersService.getFeatureConfig(req.user.sub);
    if (!config.catalog) {
       throw new ForbiddenException('Feature restricted');
    }
    return this.catalogsService.generatePdf(+id, req.user.userId);
  }
}
