import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException, NotFoundException, ParseIntPipe, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateFeatureConfigDto } from './dto/update-feature-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsAction } from '../analytics/entities/analytics-log.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly analyticsService: AnalyticsService,
  ) { }
  
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    return this.usersService.findOne(req.user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createUserDto: CreateUserDto) {
    // Only super_admin and group_admin can create users
    if (req.user.role !== 'super_admin' && req.user.role !== 'group_admin') {
      throw new ForbiddenException('Only admins can create users');
    }
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    // Only super_admin can see all users
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can view all users');
    }
    return this.usersService.findAll();
  }

  @Get('admin/dashboard')
  @UseGuards(JwtAuthGuard)
  async getAdminDashboard(@Request() req) {
    // Only super_admin can access
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can access this');
    }

    const users = await this.usersService.findAllWithDetails();
    const statsArray = await this.analyticsService.getAllUsersStats();

    // Merge stats with users
    const statsMap = new Map(statsArray.map(s => [s.userId, s]));
    const result = users.map(user => ({
      ...user,
      stats: statsMap.get(user.id) || {
        viewCount: 0,
        downloadVcf: 0,
        viewCatalog: 0,
        downloadPdf: 0,
        lastActivity: null
      }
    }));

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.is_active).length,
      users: result
    };
  }

  @Get('admin/executive-report')
  @UseGuards(JwtAuthGuard)
  async getExecutiveReport(@Request() req, @Query('period') period?: 'weekly' | 'monthly') {
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can access this');
    }

    const days = period === 'monthly' ? 30 : 7;

    const [usersSummary, activitySummary] = await Promise.all([
      this.usersService.getExecutiveUsersSummary(days),
      this.analyticsService.getExecutiveActivity(days),
    ]);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - Math.max(0, days - 1));

    const dateKeys: string[] = [];
    const cursor = new Date(startDate);
    const today = new Date();
    while (cursor <= today) {
      dateKeys.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }

    const dailyMap = new Map<string, {
      date: string;
      newUsers: number;
      loginSuccess: number;
      viewProfile: number;
      viewCatalog: number;
      downloadVcf: number;
      downloadPdf: number;
      viewLandingPage: number;
    }>();

    for (const dateKey of dateKeys) {
      dailyMap.set(dateKey, {
        date: dateKey,
        newUsers: 0,
        loginSuccess: 0,
        viewProfile: 0,
        viewCatalog: 0,
        downloadVcf: 0,
        downloadPdf: 0,
        viewLandingPage: 0,
      });
    }

    for (const item of usersSummary.newUsersDaily) {
      const target = dailyMap.get(item.date);
      if (target) {
        target.newUsers = item.count;
      }
    }

    for (const item of activitySummary.dailyActivity) {
      const target = dailyMap.get(item.date);
      if (!target) continue;
      switch (item.action) {
        case AnalyticsAction.LOGIN_SUCCESS:
          target.loginSuccess = item.count;
          break;
        case AnalyticsAction.VIEW_PROFILE:
          target.viewProfile = item.count;
          break;
        case AnalyticsAction.VIEW_CATALOG:
          target.viewCatalog = item.count;
          break;
        case AnalyticsAction.DOWNLOAD_VCF:
          target.downloadVcf = item.count;
          break;
        case AnalyticsAction.DOWNLOAD_PDF:
          target.downloadPdf = item.count;
          break;
        case AnalyticsAction.VIEW_LANDING_PAGE:
          target.viewLandingPage = item.count;
          break;
        default:
          break;
      }
    }

    return {
      period,
      days,
      generatedAt: new Date().toISOString(),
      summary: {
        totalUsers: usersSummary.totalUsers,
        activeUsers: usersSummary.activeUsers,
        premiumUsers: usersSummary.premiumUsers,
        freeUsers: usersSummary.freeUsers,
        newUsersInPeriod: usersSummary.newUsersInPeriod,
        activeUsersInPeriod: activitySummary.activeUsersInPeriod,
        loginSuccessInPeriod: activitySummary.loginSuccessInPeriod,
        viewProfileInPeriod: activitySummary.viewProfileInPeriod,
        viewCatalogInPeriod: activitySummary.viewCatalogInPeriod,
        downloadVcfInPeriod: activitySummary.downloadVcfInPeriod,
        downloadPdfInPeriod: activitySummary.downloadPdfInPeriod,
        viewLandingPageInPeriod: activitySummary.viewLandingPageInPeriod,
      },
      daily: Array.from(dailyMap.values()),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id', ParseIntPipe) targetUserId: number) {

    // Users can view their own profile, admins can view any
    if (req.user.role !== 'super_admin' && req.user.role !== 'group_admin' && req.user.sub !== targetUserId) {
      throw new ForbiddenException('You can only view your own user profile');
    }

    const user = await this.usersService.findOne(targetUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Request() req, @Param('id', ParseIntPipe) targetUserId: number, @Body() updateUserDto: UpdateUserDto) {

    // Users can update their own profile, admins can update any
    if (req.user.role !== 'super_admin' && req.user.role !== 'group_admin' && req.user.sub !== targetUserId) {
      throw new ForbiddenException('You can only update your own user profile');
    }

    const user = await this.usersService.update(targetUserId, updateUserDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  async toggleActive(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can toggle user status');
    }
    return this.usersService.toggleActive(+id);
  }

  @Patch(':id/expiration')
  @UseGuards(JwtAuthGuard)
  async setExpiration(@Request() req, @Param('id') id: string, @Body() body: { expiration_date: string | null }) {
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can set expiration date');
    }
    return this.usersService.setExpiration(+id, body.expiration_date ? new Date(body.expiration_date) : null);
  }

  @Patch(':id/tier')
  @UseGuards(JwtAuthGuard)
  async updateTier(@Request() req, @Param('id') id: string, @Body() body: { tier: string }) {
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can update user tier');
    }
    return this.usersService.updateTier(+id, body.tier);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard)
  async updateRole(@Request() req, @Param('id') id: string, @Body() body: { role: string }) {
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can update user role');
    }
    return this.usersService.updateRole(+id, body.role);
  }

  @Post('check-expired')
  @UseGuards(JwtAuthGuard)
  async checkExpiredUsers(@Request() req) {
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can run this check');
    }
    return this.usersService.disableExpiredUsers();
  }

  // Feature Config Management
  @Get(':id/feature-config')
  @UseGuards(JwtAuthGuard)
  async getFeatureConfig(@Request() req, @Param('id') id: string) {
    // Users can view their own config, super_admin can view any
    if (req.user.role !== 'super_admin' && req.user.sub !== +id) {
      throw new ForbiddenException('You can only view your own feature config');
    }
    const config = await this.usersService.getFeatureConfig(+id);
    return { feature_config: config };
  }

  @Patch(':id/feature-config')
  @UseGuards(JwtAuthGuard)
  async updateFeatureConfig(
    @Request() req,
    @Param('id') id: string,
    @Body() updateFeatureConfigDto: UpdateFeatureConfigDto,
  ) {
    // Only super_admin can update feature configs
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can update feature config');
    }
    const user = await this.usersService.updateFeatureConfig(+id, updateFeatureConfigDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post('bulk/feature-config')
  @UseGuards(JwtAuthGuard)
  async bulkUpdateFeatureConfig(
    @Request() req,
    @Body() body: { feature_config: UpdateFeatureConfigDto },
  ) {
    // Only super_admin can bulk update
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can bulk update feature config');
    }
    return this.usersService.setAllUsersFeatureConfig(body.feature_config as any);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'super_admin') {
      throw new ForbiddenException('Only super admin can delete users');
    }
    return this.usersService.remove(+id);
  }
}
