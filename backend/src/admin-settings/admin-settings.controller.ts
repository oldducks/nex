import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateAiImageSettingsDto } from './dto/update-ai-image-settings.dto';
import { AdminSettingsService } from './admin-settings.service';
import { LandingPagesService } from '../landing-pages/landing-pages.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(
    private readonly adminSettingsService: AdminSettingsService,
    private readonly landingPagesService: LandingPagesService,
  ) {}

  private ensureSuperAdmin(req: any) {
    if (req.user?.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can access admin settings');
    }
  }

  private ensureAdmin(req: any) {
    if (req.user?.role !== 'super_admin' && req.user?.role !== 'group_admin') {
      throw new ForbiddenException('Only admin can update central partner settings');
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

  @Get('central-partner-share')
  async getCentralPartnerShareSettings() {
    return this.adminSettingsService.getCentralPartnerShareSettings();
  }

  @Patch('central-partner-share')
  async updateCentralPartnerShareSettings(
    @Request() req: any,
    @Body() dto: { pitch?: string },
  ) {
    this.ensureAdmin(req);
    return this.adminSettingsService.updateCentralPartnerShareSettings(dto, req.user.sub);
  }

  @Post('central-partner-share/templates')
  async createCentralPartnerTemplate(
    @Request() req: any,
    @Body() dto: { title?: string; pitch?: string },
  ) {
    this.ensureAdmin(req);

    const timestamp = Date.now();
    const createdPage = await this.landingPagesService.create(req.user.sub, {
      title: dto.title?.trim() || `พันธมิตรธุรกิจส่วนกลาง ${timestamp}`,
      slug: `central-partner-${timestamp}`,
      description: 'Salespage ส่วนกลางสำหรับระบบพันธมิตรธุรกิจ',
      content_blocks: [],
      is_published: true,
    });

    return this.adminSettingsService.addCentralPartnerTemplate(
      createdPage.id,
      dto.pitch?.trim() || '',
      req.user.sub,
    );
  }

  @Patch('central-partner-share/templates/:landingPageId')
  async updateCentralPartnerTemplatePitch(
    @Request() req: any,
    @Param('landingPageId') landingPageId: string,
    @Body() dto: { pitch?: string },
  ) {
    this.ensureAdmin(req);
    return this.adminSettingsService.updateCentralPartnerTemplatePitch(
      Number(landingPageId),
      dto.pitch?.trim() || '',
      req.user.sub,
    );
  }

  @Delete('central-partner-share/templates/:landingPageId')
  async deleteCentralPartnerTemplate(
    @Request() req: any,
    @Param('landingPageId') landingPageId: string,
  ) {
    this.ensureAdmin(req);
    const pageId = Number(landingPageId);
    await this.landingPagesService.remove(pageId, req.user.sub);
    return this.adminSettingsService.removeCentralPartnerTemplate(pageId, req.user.sub);
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
