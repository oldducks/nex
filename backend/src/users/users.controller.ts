import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateFeatureConfigDto } from './dto/update-feature-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from '../analytics/analytics.service';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
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
