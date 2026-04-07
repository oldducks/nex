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

  @Post('ai-image/generate')
  generateImage(
    @Body()
    body: {
      prompt?: string;
      templateId?: string;
      headline?: string;
      subheadline?: string;
      ctaText?: string;
      brandName?: string;
      ratio?: '1:1' | '4:5' | '9:16';
    },
  ) {
    return this.createLiteService.generateImageFromPrompt({
      prompt: body.prompt,
      templateId: body.templateId,
      headline: body.headline,
      subheadline: body.subheadline,
      ctaText: body.ctaText,
      brandName: body.brandName,
      ratio: body.ratio,
    });
  }
}
