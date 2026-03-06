import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLiteService } from './create-lite.service';

@UseGuards(JwtAuthGuard)
@Controller('create-lite')
export class CreateLiteController {
  constructor(private readonly createLiteService: CreateLiteService) {}

  @Get('templates')
  findAll(@Query('category') category?: string) {
    return this.createLiteService.findAll(category);
  }

  @Get('templates/:id')
  findOne(@Param('id') id: string) {
    return this.createLiteService.findOne(id);
  }

  @Post('ai-copy')
  generateCopy(
    @Body()
    body: {
      templateId?: string;
      title?: string;
      subtitle?: string;
      cta?: string;
    },
  ) {
    // templateId is now optional
    return this.createLiteService.generateCopySuggestion({
      templateId: body.templateId,
      title: body.title,
      subtitle: body.subtitle,
      cta: body.cta,
    });
  }
}
