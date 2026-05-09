import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateAiImageSettingsDto } from './dto/update-ai-image-settings.dto';
import { AdminSettingsService } from './admin-settings.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  private ensureSuperAdmin(req: any) {
    if (req.user?.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can access admin settings');
    }
  }

  @Get('ai-image')
  async getAiImageSettings(@Request() req: any) {
    this.ensureSuperAdmin(req);
    return this.adminSettingsService.getAiImageSettings();
  }

  @Get('learning-media/examples')
  async getLearningMediaExamples() {
    return this.adminSettingsService.getLearningMediaExampleOverrides();
  }

  @Patch('learning-media/examples/:slug')
  async updateLearningMediaExample(
    @Request() req: any,
    @Param('slug') slug: string,
    @Body()
    dto: {
      title?: string;
      category?: string;
      description?: string;
      thumbnailUrl?: string;
      livePreviewUrl?: string;
    },
  ) {
    this.ensureSuperAdmin(req);
    return this.adminSettingsService.updateLearningMediaExampleOverride(slug, dto, req.user.sub);
  }

  @Patch('ai-image')
  async updateAiImageSettings(
    @Request() req: any,
    @Body() dto: UpdateAiImageSettingsDto,
  ) {
    this.ensureSuperAdmin(req);
    return this.adminSettingsService.updateAiImageSettings(dto, req.user.sub);
  }

  @Post('ai-image/test')
  async testAiImageSettings(@Request() req: any) {
    this.ensureSuperAdmin(req);
    return this.adminSettingsService.testAiImageSettings();
  }
}
