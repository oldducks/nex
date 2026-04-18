import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UpsertTemplateFieldDto } from './dto/upsert-template-field.dto';
import { DigitalMediaService } from './digital-media.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/digital-media')
export class DigitalMediaAdminController {
  constructor(private readonly digitalMediaService: DigitalMediaService) {}

  private ensureSuperAdmin(req: any) {
    if (req.user?.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can access template manager');
    }
  }

  @Get('categories')
  listCategories(@Request() req: any) {
    this.ensureSuperAdmin(req);
    return this.digitalMediaService.getCategories(false);
  }

  @Post('categories')
  createCategory(@Request() req: any, @Body() dto: CreateCategoryDto) {
    this.ensureSuperAdmin(req);
    return this.digitalMediaService.createCategory(dto);
  }

  @Get('templates')
  listTemplates(
    @Request() req: any,
    @Query('category_id') categoryId?: string,
    @Query('search') search?: string,
    @Query('media_type') mediaType?: 'image' | 'video',
  ) {
    this.ensureSuperAdmin(req);
    return this.digitalMediaService.listAdminTemplates({
      category_id: categoryId ? Number(categoryId) : undefined,
      search,
      media_type: mediaType,
    });
  }

  @Get('templates/:id')
  getTemplate(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    this.ensureSuperAdmin(req);
    return this.digitalMediaService.getAdminTemplateById(id);
  }

  @Post('templates')
  createTemplate(@Request() req: any, @Body() dto: CreateTemplateDto) {
    this.ensureSuperAdmin(req);
    return this.digitalMediaService.createTemplate(dto);
  }

  @Post('templates/mockup-preview')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  )
  generateMockupPreview(@Request() req: any, @Body() dto: CreateTemplateDto) {
    this.ensureSuperAdmin(req);
    return this.digitalMediaService.generateMockupPreview(dto);
  }

  @Patch('templates/:id')
  updateTemplate(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemplateDto,
  ) {
    this.ensureSuperAdmin(req);
    return this.digitalMediaService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  deleteTemplate(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    this.ensureSuperAdmin(req);
    return this.digitalMediaService.removeTemplate(id);
  }

  @Patch('templates/:id/toggle')
  toggleTemplate(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    this.ensureSuperAdmin(req);
    return this.digitalMediaService.toggleTemplate(id);
  }

  @Post('templates/:id/fields')
  addField(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertTemplateFieldDto,
  ) {
    this.ensureSuperAdmin(req);
    return this.digitalMediaService.addTemplateField(id, dto);
  }

  @Patch('fields/:fieldId')
  updateField(
    @Request() req: any,
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body() dto: UpsertTemplateFieldDto,
  ) {
    this.ensureSuperAdmin(req);
    return this.digitalMediaService.updateTemplateField(fieldId, dto);
  }

  @Delete('fields/:fieldId')
  removeField(@Request() req: any, @Param('fieldId', ParseIntPipe) fieldId: number) {
    this.ensureSuperAdmin(req);
    return this.digitalMediaService.removeTemplateField(fieldId);
  }
}
