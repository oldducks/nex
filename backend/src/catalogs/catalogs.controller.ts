import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) { }

  // Public endpoints
  @Get('public/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.catalogsService.findBySlug(slug);
  }

  @Get('view/:id')
  async findOnePublic(@Param('id') id: string) {
    return this.catalogsService.findOnePublic(+id);
  }

  // Protected endpoints
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createCatalogDto: CreateCatalogDto) {
    return this.catalogsService.create(req.user.userId, createCatalogDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    return this.catalogsService.findAll(req.user.userId);
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Request() req, @Param('id') id: string) {
    return this.catalogsService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req, @Param('id') id: string, @Body() updateCatalogDto: UpdateCatalogDto) {
    return this.catalogsService.update(+id, req.user.userId, updateCatalogDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.catalogsService.remove(+id, req.user.userId);
  }

  @Post(':id/generate-pdf')
  @UseGuards(JwtAuthGuard)
  generatePdf(@Request() req, @Param('id') id: string) {
    return this.catalogsService.generatePdf(+id, req.user.userId);
  }
}
