import { Body, Controller, ForbiddenException, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
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
